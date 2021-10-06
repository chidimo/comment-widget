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
  });

  it('should render suggested users only when @ is typed', () => {
    render(<TextAreaWidget />);
    const usersArea = screen.getByTestId('suggestionBox');
    const inputArea = screen.getByTestId('textareaWidget');

    expect(usersArea).toHaveStyle('display: none');
    userEvent.type(inputArea, '@');
    expect(usersArea).toHaveStyle('display: block');
  });

  it('should render correct list of matching users', async () => {
    render(<TextAreaWidget />);
    const usersArea = screen.getByTestId('suggestionBox');
    const inputArea = screen.getByTestId('textareaWidget');

    await userEvent.type(inputArea, '@paul', { delay: 150 });
    expect(usersArea).toHaveStyle('display: block');

    // this line relies on the existing users data set
    expect(usersArea.childNodes).toHaveLength(3);
  });

  it('should render a matching user inside the textarea', async () => {
    render(<TextAreaWidget />);
    const usersArea = screen.getByTestId('suggestionBox');
    const inputArea = screen.getByTestId('textareaWidget');

    await userEvent.type(inputArea, 'this is @paul', { delay: 150 });
    expect(usersArea).toHaveStyle('display: block');

    const user = usersArea.childNodes[0];
    userEvent.click(user);

    expect(inputArea.textContent).toBe('this is @pturner0');
  });
});
