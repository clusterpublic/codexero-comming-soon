# CodeXero - Coming Soon Page

A beautiful, modern coming soon page built with Vite and React. This project features a stunning design with a countdown timer, email signup form, and responsive layout.

## ✨ Features

- **Modern Design**: Beautiful gradient background with glassmorphism effects
- **Countdown Timer**: Real-time countdown to launch date
- **Email Signup**: Collect visitor emails for launch notifications
- **Responsive Layout**: Mobile-first design that works on all devices
- **Smooth Animations**: Floating shapes and hover effects
- **Professional Typography**: Clean, readable fonts with proper hierarchy

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd codexero-comming-soon
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
codexero-comming-soon/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Styles for the coming soon page
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
└── README.md            # Project documentation
```

## 🎨 Customization

### Changing the Launch Date

Edit the `targetDate` in `src/App.jsx`:

```javascript
// Set target date (30 days from now)
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 30);
```

### Updating Brand Information

Modify the logo and tagline in `src/App.jsx`:

```javascript
<div className="logo">CodeXero</div>
<div className="tagline">Coming Soon</div>
```

### Styling

All styles are in `src/App.css`. The design uses:
- CSS custom properties for easy theming
- Flexbox and Grid for layout
- CSS animations and transitions
- Responsive breakpoints for mobile devices

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized files ready for deployment.

### Deploy to Various Platforms

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your repository for automatic deployments
- **GitHub Pages**: Use the `dist` folder as your source
- **Traditional hosting**: Upload the `dist` folder contents

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you have any questions or need help, please open an issue in the repository.

---

**Built with ❤️ using Vite + React**
