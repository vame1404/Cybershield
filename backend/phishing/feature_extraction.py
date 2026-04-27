import re
import socket
from urllib.parse import urlparse

# -----------------------------
# Feature Functions
# -----------------------------

def having_ip(url):
    ip_pattern = r'(([01]?\d\d?|2[0-4]\d|25[0-5])\.){3}([01]?\d\d?|2[0-4]\d|25[0-5])'
    return 1 if re.search(ip_pattern, url) else 0


def have_at_symbol(url):
    return 1 if "@" in url else 0


def get_url_length(url):
    return len(url)


def get_depth(url):
    path = urlparse(url).path.split('/')
    depth = sum(1 for p in path if p)
    return depth


def redirection(url):
    pos = url.rfind('//')
    return 1 if pos > 6 else 0


def https_in_domain(url):
    domain = urlparse(url).netloc
    return 1 if 'https' in domain else 0


def tiny_url(url):
    shortening_services = r"bit\.ly|goo\.gl|tinyurl|ow\.ly|t\.co|is\.gd|buff\.ly"
    return 1 if re.search(shortening_services, url) else 0


def prefix_suffix(url):
    return 1 if '-' in urlparse(url).netloc else 0


def dns_record(domain):
    try:
        socket.gethostbyname(domain)
        return 0
    except Exception:
        return 1


def web_traffic(domain):
    return 0


def domain_age(domain):
    return 0


def domain_end(domain):
    return 0


def html_features(url):
    """
    Safely fetch HTML features with a short timeout.
    Returns zeros on any failure to avoid blocking the API.
    """
    try:
        import requests as _req
        response = _req.get(url, timeout=3, allow_redirects=True)
        html = response.text.lower()
        iframe = 1 if "<iframe" in html else 0
        mouse_over = 1 if "onmouseover" in html else 0
        right_click = 1 if "event.button==2" in html else 0
        forwards = 1 if len(response.history) > 0 else 0
        return iframe, mouse_over, right_click, forwards
    except Exception:
        return 0, 0, 0, 0


# -----------------------------
# Main Extraction Function
# Returns a plain Python list (not a DataFrame) for model compatibility
# -----------------------------

def extract_features(url):
    parsed = urlparse(url)
    domain = parsed.netloc

    iframe, mouse_over, right_click, forwards = html_features(url)

    features = [
        having_ip(url),           # Have_IP
        have_at_symbol(url),       # Have_At
        get_url_length(url),       # URL_Length
        get_depth(url),            # URL_Depth
        redirection(url),          # Redirection
        https_in_domain(url),      # https_Domain
        tiny_url(url),             # TinyURL
        prefix_suffix(url),        # Prefix/Suffix
        dns_record(domain),        # DNS_Record
        web_traffic(domain),       # Web_Traffic
        domain_age(domain),        # Domain_Age
        domain_end(domain),        # Domain_End
        iframe,                    # iFrame
        mouse_over,                # Mouse_Over
        right_click,               # Right_Click
        forwards                   # Web_Forwards
    ]

    return features