# Deployment Guide: FindATeacher AI (Full Vercel)

This guide covers deploying both the **Frontend** and **Backend** to **Vercel** as separate projects from the same repository.

## Prerequisites

- GitHub Account
- [Vercel](https://vercel.com) Account
- a MySQL Database (Recommended: [Aiven](https://aiven.io/mysql))

---

## Part 1: Database Setup (Aiven Guide)

**What is Aiven?**
Aiven is a cloud platform that manages databases for you. They handle the servers, backups, and updates so you don't have to. They offer a specific "Free Plan" for MySQL which is perfect for this project.

**Step-by-step Setup:**

1.  **Sign Up**: Go to [console.aiven.io/signup](https://console.aiven.io/signup) and create an account.
2.  **Create Service**:
    -   Click **+ Create service**.
    -   Select **MySQL**.
    -   **Cloud**: Choose `Google Cloud` or `DigitalOcean` (look for the region that says "Free Plan" or "Hobbyist").
    -   **Plan**: Select the **Free** plan (might be labeled "Free" or "Hobbyist" - usually 1 CPU, 1GB RAM).
    -   **Name**: Give it a name like `findateacher-db`.
    -   Click **Create Service**.
3.  **Get Connection Details**:
    -   Wait for the service to start (status turns from "Rebuilding" to "Running").
    -   On the **Overview** page, look for **Connection information**.
    -   Copy these values:
        -   **Host**: (e.g., `mysql-12345-yourname.aivencloud.com`)
        -   **Port**: (e.g., `12345` - *Note: It is usually NOT 3306 on Aiven*)
        -   **User**: (e.g., `avnadmin`)
        -   **Password**: (Show the password and copy it)
        -   **Database Name**: `defaultdb` (You can create a new one called `findateacher` in the "Databases" tab, or just use `defaultdb`).

**How to Connect:**
You do **not** need to change any code. The code is already written to use Environment Variables. You will paste these values into Vercel in Part 2.

---

## Part 2: Backend Deployment (Vercel)

1.  **Push Code to GitHub**: Ensure your latest code is on GitHub.
2.  **Import Project**:
    -   Log in to Vercel.
    -   Click **Add New...** -> **Project**.
    -   Import your GitHub repository.
3.  **Configure Project**:
    -   **Project Name**: `findateacher-api` (example)
    -   **Framework Preset**: **Other** (Do not select Vite here).
    -   **Root Directory**: Click "Edit" and select `backend`.
    -   **Build Command**: `npm install`
4.  **Environment Variables**:
    -   Add the values you got from Aiven:
        -   `DB_HOST`: (Your Aiven Host)
        -   `DB_USER`: (Your Aiven User)
        -   `DB_PASSWORD`: (Your Aiven Password)
        -   `DB_NAME`: (Your Database Name)
        -   `DB_PORT`: (Your Aiven Port - important!)
        -   `NODE_ENV`: `production`
5.  **Deploy**: Click **Deploy**.
6.  **Copy URL**: Once deployed, copy your backend URL (e.g., `https://findateacher-api.vercel.app`).

---

## Part 3: Frontend Deployment (Vercel)

1.  **Import Project (Again)**:
    -   Go back to Vercel Dashboard.
    -   Click **Add New...** -> **Project**.
    -   Import the **same** GitHub repository again.
2.  **Configure Project**:
    -   **Project Name**: `findateacher-frontend` (example)
    -   **Framework Preset**: **Vite**.
    -   **Root Directory**: Click "Edit" and select `frontend`.
3.  **Environment Variables**:
    -   Add the following:
        -   `VITE_API_URL`: Your Backend URL from Part 2 (e.g., `https://findateacher-api.vercel.app`)
            -   *Note: Do not add a trailing slash `/`*
4.  **Deploy**: Click **Deploy**.

---

## Part 4: Final Check

1.  Open your Frontend URL.
2.  Test the functionality.

### Troubleshooting

-   **Database Error**: Check Vercel logs. If it says "ECONNREFUSED", check your `DB_HOST` and `DB_PORT`.
-   **SSL**: Aiven requires SSL by default. The `mysql2` library usually handles this automatically, but if you have issues, let me know.
