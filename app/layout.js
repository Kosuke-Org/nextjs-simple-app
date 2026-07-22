export const metadata = {
  title: 'Kosuke Pokemon Website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
