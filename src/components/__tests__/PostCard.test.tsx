import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PostCard from '../PostCard';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('PostCard', () => {
  const mockProps = {
    slug: 'test-post',
    title: 'Test Post Title',
    date: '2024-01-01',
    tags: ['test', 'react'],
    excerpt: 'This is a test post excerpt',
  };

  it('renders post title correctly', () => {
    render(<PostCard {...mockProps} />);

    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders formatted date correctly', () => {
    render(<PostCard {...mockProps} />);

    // Date should be formatted
    const dateElement = screen.getByText(/2024年/);
    expect(dateElement).toBeInTheDocument();
  });

  it('renders tags correctly', () => {
    render(<PostCard {...mockProps} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('renders excerpt correctly', () => {
    render(<PostCard {...mockProps} />);

    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
  });

  it('calls onTagClick when tag is clicked', async () => {
    const onTagClick = jest.fn();
    render(<PostCard {...mockProps} onTagClick={onTagClick} />);

    const tagElement = screen.getByText('test');
    await userEvent.click(tagElement);

    expect(onTagClick).toHaveBeenCalledWith('test');
  });

  it('does not render tags when not provided', () => {
    const propsWithoutTags = { ...mockProps, tags: undefined };
    render(<PostCard {...propsWithoutTags} />);

    expect(screen.queryByText('test')).not.toBeInTheDocument();
  });

  it('does not render excerpt when not provided', () => {
    const propsWithoutExcerpt = { ...mockProps, excerpt: undefined };
    render(<PostCard {...propsWithoutExcerpt} />);

    expect(screen.queryByText('This is a test post excerpt')).not.toBeInTheDocument();
  });

  it('renders link with correct href', () => {
    render(<PostCard {...mockProps} />);

    const link = screen.getByRole('link', { name: /Test Post Title/i });
    expect(link).toHaveAttribute('href', '/posts/test-post');
  });

  it('has correct structure', () => {
    const { container } = render(<PostCard {...mockProps} />);

    expect(container.firstChild).toHaveClass('overflow-hidden', 'rounded-xl');
  });

  it('formats invalid date gracefully', () => {
    const propsWithInvalidDate = { ...mockProps, date: 'invalid-date' };
    render(<PostCard {...propsWithInvalidDate} />);

    // Should still render, but with different format
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
  });
});
