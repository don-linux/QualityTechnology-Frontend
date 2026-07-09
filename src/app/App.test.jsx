import { render } from '@testing-library/react';
import App from "@app/App";

test('renders without crashing', () => {
  render(<App />);
});
