import torch
import torch.nn as nn
import torchvision
import numpy as np

# -------- Frequency Filter --------
class FrequencyFilter(nn.Module):
    def __init__(self, radiuslow=30, radiushigh=100):
        super(FrequencyFilter, self).__init__()
        self.radiuslow = radiuslow
        self.radiushigh = radiushigh

    def forward(self, image):
        freq_image = torch.fft.fftn(image, dim=(-2, -1))
        freq_image = torch.fft.fftshift(freq_image, dim=(-2, -1))

        b, c, h, w = freq_image.shape
        y_grid, x_grid = torch.meshgrid(
            torch.arange(h, device=image.device),
            torch.arange(w, device=image.device),
            indexing='ij'
        )

        center_y, center_x = h // 2, w // 2
        dist = torch.sqrt((y_grid - center_y) ** 2 + (x_grid - center_x) ** 2)

        mask = torch.zeros((h, w), device=image.device)
        mask[(dist >= self.radiuslow) & (dist < self.radiushigh)] = 1

        mid_freq = freq_image * mask.unsqueeze(0).unsqueeze(0)
        mid_freq = torch.fft.ifftshift(mid_freq, dim=(-2, -1))
        mid_freq_spatial = torch.abs(torch.fft.ifftn(mid_freq, dim=(-2, -1)))

        mid_freq_spatial = (
            mid_freq_spatial - mid_freq_spatial.min() + 1e-8
        ) / (mid_freq_spatial.max() - mid_freq_spatial.min() + 1e-8)

        return mid_freq_spatial


# -------- Simplified FIRE --------
class SimplifiedFIRE(nn.Module):
    def __init__(self, pretrained=False):
        super(SimplifiedFIRE, self).__init__()

        self.backbone = torchvision.models.resnet18(weights=None)

        self.backbone.conv1 = nn.Conv2d(
            6, 64, kernel_size=7, stride=2, padding=3, bias=False
        )

        self.backbone.fc = nn.Linear(512, 1)

        self.freq_filter = FrequencyFilter()

    def forward(self, x):
        mid_freq = self.freq_filter(x)
        combined = torch.cat([x, mid_freq], dim=1)
        out = self.backbone(combined)
        return out