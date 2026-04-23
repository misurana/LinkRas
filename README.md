rt capabilities.

## Key Features

- **AI-Powered Insights**: Integrated with **Google Gemini Flash** for intelligent content analysis and chat.
- - **Interactive UI**: Features a beautiful "magazine-style" interface using **React PageFlip**.
- - **Smooth Animations**: Powered by **Framer Motion** for a seamless user experience.
- - **Data Export**: Export your data and reports to **PDF** (via jsPDF) or **Excel** (via XLSX).
- - **QR Code Generation**: Built-in QR code generator for easy link sharing.
- - **Backend Integration**: Secured and managed using **Supabase**.
- - **Modern Styling**: Styled with **Tailwind CSS** for a responsive and professional look.
-
- ## Tech Stack
-
- - **Frontend**: React 19, Vite, Tailwind CSS
- - **AI**: Google Generative AI (Gemini)
- - **Backend**: Supabase
- - **Libraries**:
-   - Framer Motion (Animations)
-   - React PageFlip (UI Effect)
-   - jsPDF & html2canvas (PDF Export)
    -   - XLSX (Excel Export)
        -   - QRCode.react (QR Generation)
            -
            - ## Getting Started
            -
            - 1. Clone the repository.
              2. 2. Install dependencies:
                 3.    ```bash
                          npm install
                          ```
                       3. Set up your environment variables for Gemini and Supabase.
                       4. 4. Run the development server:
                          5.    ```bash
                                   npm run dev
                                   ```

                            ---
                          Built with passion by Mukesh Rana.
                          # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
