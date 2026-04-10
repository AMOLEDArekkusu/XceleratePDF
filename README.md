<a name="XceleratePDF"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  
  <h3 align="center">XceleratePDF</h3>



<!-- BADGES -->
<div align="center">
  <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#deployment">Deployment</a></li>
  </ol>
</details>

## About The Project

This is a comprehensive, production-ready full-stack application. It uses a Next.js (React) frontend styled with Tailwind CSS strictly for building a beautiful interface, paired seamlessly with a native Python 3 Backend executing on Vercel's serverless ecosystem.

**Key Features:**
* **Batch Conversion**: Handles massive multi-sheet `.xlsx` or `.xls` workbooks intuitively.
* **Native Unicode Support**: Preserves all international characters smoothly.
* **Minimalistic Modern UI**: Employs an ultra-modern aesthetic with glassmorphic layers and interactive states.
* **Vercel Ready**: Simply drag-and-deploy without messy CI/CD pipelines. 

### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![Tailwind][Tailwind CSS]][Tailwind-url]
* [![Python][Python.org]][Python-url]

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need `Node.js` (for running the Next.js frontend) and `Python` installed globally.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username/repo_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create a python virtual environment and install backend requirements (if running locally natively rather than Vercel CLI)
   ```sh
   cd api
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

## Usage

1. Run the local development server:
   ```sh
   npm run dev
   ```
2. By default, Next.js will detect the `api` folder and you can access your backend via Next.js proxy routes to `http://localhost:3000/api/convert`.
3. Drop an `.xlsx` file into the active zone. It automatically scans it, converts every sheet to an integrated lightweight internal HTML table hierarchy, then produces a native PDF, feeding it back as an instant download.

## Deployment

This app is natively built to map flawlessly into **Vercel**. 
1. Push your repository to GitHub.
2. Link your GitHub to Vercel via Vercel Dashboard.
3. Configure settings? **None!** `vercel.json` already contains everything needed to spin up Both Next.js (frontend) and Python (`api/index.py`) side-by-side using Vercel's dynamic builders.

## Roadmap

- [x] Initial Excel mapping
- [x] Integrate python-PDF libraries.
- [ ] Add explicit sheet selection pre-download (UI expansion).
- [ ] Implement dark-mode.

<!-- MARKDOWN LINKS & IMAGES -->
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind CSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Python.org]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://python.org/
