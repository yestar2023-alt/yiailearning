import { render, screen } from '@testing-library/react';
import { Loading } from '../Loading';

describe('Loading', () => {
  it('renders loading component', () => {
    render(<Loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders spinner icon', () => {
    render(<Loading />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('renders loading text', () => {
    render(<Loading />);

    expect(screen.getByText(/加载中/i)).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<Loading message="Custom loading message" />);

    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<Loading />);

    expect(container.firstChild).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('applies custom className', () => {
    const { container } = render(<Loading className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
