import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ContentEditable } from './ContentEditable';

const TEST_STRING = 'editable';

test('renders comments screen', async () => {
  render(<ContentEditable />);
  expect(screen.getByText(/comments/i)).toBeInTheDocument();

  const commentDiv = screen.getByTestId('editDiv');

  await userEvent.type(commentDiv, TEST_STRING, { delay: 100 });
  expect(commentDiv.textContent).toBe(TEST_STRING);
  // screen.debug(commentDiv);
});
