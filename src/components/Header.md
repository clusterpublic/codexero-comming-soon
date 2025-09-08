# Header Component

A reusable header component for the CodeXero application that can be used across all pages.

## Features

- **Logo with Animation**: Animated CodeXero logo with hover effects
- **Wallet Connection**: Built-in ConnectWallet component
- **Waitlist Button**: Optional "Get Early Access" button
- **Responsive Design**: Mobile-friendly layout
- **Consistent Styling**: Uses the same theme as the main application

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onWaitlistOpen` | `function` | `undefined` | Callback function when waitlist button is clicked |
| `showWaitlistButton` | `boolean` | `true` | Whether to show the waitlist button |
| `className` | `string` | `""` | Additional CSS classes for custom styling |

## Usage Examples

### Basic Usage (with waitlist button)
```jsx
import Header from '../components/Header';

function MyPage() {
  const handleWaitlistOpen = () => {
    // Handle waitlist modal opening
    setWaitlistOpen(true);
  };

  return (
    <div>
      <Header onWaitlistOpen={handleWaitlistOpen} />
      {/* Rest of your page content */}
    </div>
  );
}
```

### Without Waitlist Button
```jsx
import Header from '../components/Header';

function MyPage() {
  return (
    <div>
      <Header showWaitlistButton={false} />
      {/* Rest of your page content */}
    </div>
  );
}
```

### With Custom Styling
```jsx
import Header from '../components/Header';

function MyPage() {
  return (
    <div>
      <Header 
        showWaitlistButton={false} 
        className="custom-header-styles"
      />
      {/* Rest of your page content */}
    </div>
  );
}
```

## Implementation in Different Pages

### HomePage
- Uses full header with waitlist button
- `showWaitlistButton={true}` (default)
- `onWaitlistOpen` callback to open waitlist modal

### MintNft Page
- Uses header without waitlist button
- `showWaitlistButton={false}`
- Focuses on NFT platform functionality

### Privacy Policy & Terms of Service
- Uses header without waitlist button
- `showWaitlistButton={false}`
- Legal pages with consistent branding

## Styling

The Header component uses the existing CSS classes from `App.css`:
- `.header` - Main header container
- `.logo` - Logo section
- `.nav` - Navigation section
- `.get-started-btn` - Waitlist button styling

## Dependencies

- `ConnectWallet` component for wallet connection
- Logo image from `../assets/logo.png`
- CSS classes from `App.css`

## Notes

- The component automatically handles responsive design
- Logo animations are included by default
- Wallet connection is always available
- Waitlist button can be conditionally hidden
- Maintains consistent branding across all pages
