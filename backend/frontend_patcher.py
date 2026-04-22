import os
import re

FRONTEND_DIR = r"c:\Users\HP\OneDrive\Desktop\Clg and work\Major-proj\CYBERSHIELD-AI-SECURITY-PLATFORM\frontend\src"

def patch_api_js():
    api_js_path = os.path.join(FRONTEND_DIR, "services", "api.js")
    with open(api_js_path, "r", encoding='utf8') as f:
        content = f.read()

    # Append new API endpoints under amlAPI
    new_apis = """
// ============================================
// New API Endpoints (CyberShield 2 Integration)
// ============================================

export const creditCardAPI = {
  analyzeCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/credit-card/analyze/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const aiGeneratedAPI = {
  analyzeImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/ai-generated/analyze/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

export const documentAPI = {
  analyzeImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/fake-document/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}
"""
    if "creditCardAPI" not in content:
        content += new_apis
        with open(api_js_path, "w", encoding='utf8') as f:
            f.write(content)
        print("Updated api.js")

def patch_app_jsx():
    app_jsx_path = os.path.join(FRONTEND_DIR, "App.jsx")
    with open(app_jsx_path, "r", encoding='utf8') as f:
        content = f.read()

    if "AIGeneratedDetection" not in content:
        # Inject imports
        imports = """import AIGeneratedDetection from './pages/AIGeneratedDetection'
import FakeDocumentDetection from './pages/FakeDocumentDetection'
import CreditCardFraud from './pages/CreditCardFraud'
"""
        content = content.replace("import Reports from './pages/Reports'", "import Reports from './pages/Reports'\n" + imports)
        
        # Replace AML Route and add new ones
        routes = """<Route path="/aml" element={<CreditCardFraud />} />
              <Route path="/ai-generated" element={<AIGeneratedDetection />} />
              <Route path="/fake-document" element={<FakeDocumentDetection />} />"""
        
        content = content.replace('<Route path="/aml" element={<AMLDetection />} />', routes)
        
        with open(app_jsx_path, "w", encoding='utf8') as f:
            f.write(content)
        print("Updated App.jsx")

def patch_sidebar():
    sidebar_path = os.path.join(FRONTEND_DIR, "components", "Sidebar.jsx")
    with open(sidebar_path, "r", encoding='utf8') as f:
        content = f.read()

    if "/ai-generated" not in content:
        # Add lucide icons
        content = content.replace("Settings", "Settings, ImageIcon, FileSearch")
        
        # Add menu items
        menu_items = """{ path: '/aml', icon: Banknote, label: 'Credit Card Fraud', color: 'text-emerald-400' },
  { path: '/ai-generated', icon: ImageIcon, label: 'AI Image Detect', color: 'text-pink-400' },
  { path: '/fake-document', icon: FileSearch, label: 'Forged Document', color: 'text-indigo-400' },"""
        
        content = re.sub(r"\{\s*path:\s*'/aml',\s*icon:\s*Banknote,\s*label:\s*'AML Detection',\s*color:\s*'text-[^']+'\s*\},", menu_items, content)
        
        with open(sidebar_path, "w", encoding='utf8') as f:
            f.write(content)
        print("Updated Sidebar.jsx")

if __name__ == "__main__":
    patch_api_js()
    patch_app_jsx()
    patch_sidebar()
