import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  'react-router-dom',
  () => {
    const React = require('react');
    return {
      BrowserRouter: ({ children }) => <div>{children}</div>,
      Routes: ({ children }) => {
        const first = React.Children.toArray(children)[0];
        return first || null;
      },
      Route: ({ element }) => element || null,
      Link: ({ children, to, ...props }) => (
        <a href={to} {...props}>
          {children}
        </a>
      ),
      Navigate: () => null,
      Outlet: () => null,
      useNavigate: () => jest.fn(),
      useLocation: () => ({ pathname: '/' }),
    };
  },
  { virtual: true }
);

test('renders PharmaSure application landing page', () => {
  render(<App />);
  const logoElement = screen.getByAltText(/PharmaSure: Predictive Expiry/i);
  expect(logoElement).toBeInTheDocument();
});
