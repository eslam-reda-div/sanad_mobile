import { render } from '@testing-library/react-native';
import HomeScreen from '../app/home';

// Simple smoke test to ensure HomeScreen renders without crashing
describe('HomeScreen', () => {
  it('renders Home title', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText(/SANAD Home/i)).toBeTruthy();
  });
});
