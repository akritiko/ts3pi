# ts3pi - URL Recorder Chrome Extension

**ts3pi** is a lightweight Google Chrome (and Chromium-based browsers) extension that helps you record, categorize, and manage web pages you visit. Easily export your saved URLs in **CSV, JSON, and HTML** formats or import a list from a JSON file.

## 🚀 Features
- **Record web pages** with:
  - **URL**
  - **Title** (sanitized for CSV compatibility)
  - **Author** (if available)
  - **Custom category** (user-defined)
  - **Notes** (user-defined)
- **Filter & Sort Entries** by Author or Custom Category.
- **Export your list** in CSV, JSON, or HTML formats.
- **Import JSON** to restore or replace saved entries.
- **Clear list** with one click.
- **Open List View** for easy browsing of saved entries.

## 🛠️ Installation

### 1️⃣ Clone or Download the Repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/ts3pi.git
cd ts3pi
```

### 2️⃣ Load the Extension in Chrome
1. Open **Google Chrome** (or another Chromium-based browser).
2. Navigate to `chrome://extensions/`.
3. Enable **Developer Mode** (top-right corner).
4. Click **Load unpacked** and select the `ts3pi` project folder.
5. The extension will now be installed and available in the extensions toolbar!

---

## 📌 Usage

### **Recording a Page**
1. Click the **ts3pi** extension icon in the Chrome toolbar.
2. Click **"Record Page"**.
3. A popup will prompt you for a **Custom Category** and **Notes** (optional).
4. Your entry will be saved.

### **Opening and Managing the List**
1. Click **"Open List"** to view your saved entries.
2. Use **filters** to search by Author or Custom Category.
3. Click **column headers** to sort entries.

### **Exporting Data**
- **CSV**: Download a comma-separated values file.
- **JSON**: Export as structured JSON data.
- **HTML**: Save an HTML file for offline access.

### **Importing Data**
- Click **"Import JSON"** and select a `.json` file.
- You will be prompted to confirm replacing the existing list.

### **Clearing the List**
- Click **"Clear List"** to remove all saved entries.

---

## ⚙️ Development & Contribution

### 🔧 Local Development
To make changes or contribute:
1. Fork this repository.
2. Clone your fork and switch to a new branch:
   ```bash
   git checkout -b feature-branch-name
   ```
3. Make your changes.
4. Test the extension locally by following the installation steps.
5. Commit and push:
   ```bash
   git commit -m "Add new feature X"
   git push origin feature-branch-name
   ```
6. Open a **Pull Request** (PR) on GitHub.

### 🏗️ Code Style Guidelines
- JavaScript follows **ES6+ standards**.
- Use meaningful **variable names** and **comments**.
- Follow standard indentation and formatting.

---

## 📜 License
This project is licensed under the **MIT License**.  
See the [[LICENSE](LICENSE)](https://github.com/akritiko/ts3pi?tab=MIT-1-ov-file#readme) file for details.

---

## 📧 Contact
For questions, suggestions, or bug reports, feel free to open an **issue** on GitHub or contact:  
📩 **akritiko@gmail.com**  

---
✨ **Happy Browsing with ts3pi!** 🚀

