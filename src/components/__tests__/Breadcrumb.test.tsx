import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Breadcrumb from '../Breadcrumb';

describe('Breadcrumb', () => {
  it('renders breadcrumb navigation', () => {
    const items = [
      { name: 'Home', href: '/' },
      { name: 'Category', href: '/category' },
      { name: 'Post', href: '/category/post', current: true },
    ];

    render(<Breadcrumb items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });
});
