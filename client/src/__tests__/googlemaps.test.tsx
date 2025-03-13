import React from 'react';
import { render } from '@testing-library/react';
import CustomGoogleMap from '@/components/GoogleMap';

test('renders CustomGoogleMap component', () => {
  const { getByText } = render(<CustomGoogleMap />);
  const linkElement = getByText(/Satellite View/i);
  expect(linkElement).toBeInTheDocument();
});
