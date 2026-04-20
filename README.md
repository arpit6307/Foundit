# 🛡️ FoundIt - Next-Gen Asset Recovery & Security Vault

![FoundIt Header](https://raw.githubusercontent.com/arpit6307/foundit-copy/main/src/assets/hero.png)

**FoundIt** ek military-grade encrypted "Lost and Found" platform hai jo physical assets ko digital identity ke saath secure karta hai. Yeh platform premium "Cyber-Gold" aesthetics aur advanced Firebase architecture par base hai, jo user privacy ko top priority deta hai.

---

## 🚀 System Features (The Protocols)

### 👤 User End (Operative Dashboard)
* **Encrypted Minting:** Unique QR codes generate karein jo aapke physical items (Keys, Wallet, Laptop) ko secure digital database se link karte hain.
* **Privacy Handshake:** Finder ko kabhi bhi owner ka personal number nahi dikhta jab tak owner khud handshake authorize na kare.
* **Cyber Coins System:** Platform par activities aur referrals ke zariye "Cyber Coins (CC)" earn karein, jise real cash mein withdraw kiya ja sakta hai.
* **Vault Tracking:** Apne saare secure tags ko ek dashboard se monitor karein aur status (Lost/Secure) update karein.

### ⚡ Admin End (Aegis Terminal)
* **System Overview:** Global transactions, active users aur system health ko real-time monitor karein.
* **Revenue Terminal:** Saare withdrawal requests ko approve ya reject karein.
* **Breach Protocol:** Lost items aur reports ko manage karne ka centralized control.
* **Operative Database:** Users ki details aur unke subscription status ka complete access.

---

## 🛠️ Technical Stack (The Architecture)

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 (Vite) |
| **Backend** | Firebase v12 (Firestore, Auth, Storage) |
| **Mobile** | Capacitor JS (Native Android/iOS Readiness) |
| **Styling** | React-Bootstrap + Custom Premium CSS |
| **Animations** | Framer Motion (Cyber-Glow Effects) |
| **Icons** | Lucide React |

---

## 📥 Installation & Setup

### Prerequisites
* Node.js (v18+)
* NPM ya Yarn
* Firebase Account

### Setup Steps
1.  **Repository Clone Karein:**
    ```bash
    git clone [https://github.com/arpit6307/foundit-copy.git](https://github.com/arpit6307/foundit-copy.git)
    cd foundit-copy
    ```

2.  **Dependencies Install Karein:**
    ```bash
    npm install
    ```

3.  **Firebase Configuration:**
    `src/firebase-config.js` mein apni Firebase credentials add karein.

4.  **Local Development Run Karein:**
    ```bash
    npm run dev
    ```

5.  **Mobile Testing (Network Host):**
    Apne mobile par test karne ke liye:
    ```bash
    npm run dev -- --host
    ```

---

## 📱 Mobile Deployment (Capacitor)

FoundIt fully optimized hai mobile app ke liye. Ise Android APK mein convert karne ke liye:

```bash
# Web Build banayein
npm run build

# Android files sync karein
npx cap sync android

# Android Studio mein open karein
npx cap open android