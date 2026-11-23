export const metadata = {
  title: 'Gatherly · Find events worth showing up for',
  description: 'Discover and book concerts, meetups and workshops near you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
