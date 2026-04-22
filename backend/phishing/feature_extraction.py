import pandas as pd
import re
import requests
from urllib.parse import urlparse
import socket

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
    except:
        return 1


def web_traffic(domain):
    # Placeholder — real Alexa API removed
    return 0


def domain_age(domain):
    # Placeholder unless WHOIS used
    return 0


def domain_end(domain):
    # Placeholder unless WHOIS used
    return 0


def html_features(url):
    try:
        response = requests.get(url, timeout=5)
        html = response.text.lower()

        iframe = 1 if "<iframe" in html else 0
        mouse_over = 1 if "onmouseover" in html else 0
        right_click = 1 if "event.button==2" in html else 0
        forwards = 1 if len(response.history) > 0 else 0

        return iframe, mouse_over, right_click, forwards

    except:
        return 0, 0, 0, 0


# -----------------------------
# Main Extraction Function
# -----------------------------

def extract_features(url):

    parsed = urlparse(url)
    domain = parsed.netloc

    iframe, mouse_over, right_click, forwards = html_features(url)

    features = {
        'Have_IP': having_ip(url),
        'Have_At': have_at_symbol(url),
        'URL_Length': get_url_length(url),
        'URL_Depth': get_depth(url),
        'Redirection': redirection(url),
        'https_Domain': https_in_domain(url),
        'TinyURL': tiny_url(url),
        'Prefix/Suffix': prefix_suffix(url),
        'DNS_Record': dns_record(domain),
        'Web_Traffic': web_traffic(domain),
        'Domain_Age': domain_age(domain),
        'Domain_End': domain_end(domain),
        'iFrame': iframe,
        'Mouse_Over': mouse_over,
        'Right_Click': right_click,
        'Web_Forwards': forwards
    }

    df = pd.DataFrame([features])

    return df