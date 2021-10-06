import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TextAreaWidget } from './TextAreaWidget';

const TEST_STRING = 'textarea';

describe('<TextAreaWidget />', () => {
  it('should renders widget', () => {
    render(<TextAreaWidget />);
    expect(screen.getByText(/comments/i)).toBeInTheDocument();

    const inputArea = screen.getByTestId('textareaWidget');

    userEvent.type(inputArea, TEST_STRING);
    expect(inputArea.textContent).toBe(TEST_STRING);
    // screen.debug(inputArea);
  });

  it('should render suggested users only when @ is typed', () => {
    render(<TextAreaWidget />);
    const inputArea = screen.getByTestId('textareaWidget');

    expect(screen.getByTestId('suggestionBox')).toHaveStyle('display: none');
    userEvent.type(inputArea, '@');
    expect(screen.getByTestId('suggestionBox')).toHaveStyle('display: block');
  });

  it('should render correct list of matching users', async () => {
    render(<TextAreaWidget />);
    const inputArea = screen.getByTestId('textareaWidget');

    await userEvent.type(inputArea, '@paul', { delay: 150 });
    expect(screen.getByTestId('suggestionBox')).toHaveStyle('display: block');
    // screen.debug(inputArea);

    // this line relies on the existing users data set
    expect(screen.getByTestId('suggestionBox').childNodes).toHaveLength(3);

    screen.debug();
  });
});
