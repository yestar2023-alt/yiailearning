import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../Pagination';

describe('Pagination', () => {
  it('renders pagination with correct page numbers', () => {
    render(<Pagination currentPage={1} totalPages={10} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={10} />);

    const currentPage = screen.getByText('3');
    expect(currentPage.parentElement).toHaveClass('bg-primary');
  });

  it('calls onPageChange when page is clicked', async () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChange} />);

    const page2 = screen.getByText('2');
    await userEvent.click(page2);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={10} />);

    const prevButton = screen.getByRole('button', { name: /上一页/i });
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={10} totalPages={10} />);

    const nextButton = screen.getByRole('button', { name: /下一页/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables navigation buttons on middle pages', () => {
    render(<Pagination currentPage={5} totalPages={10} />);

    const prevButton = screen.getByRole('button', { name: /上一页/i });
    const nextButton = screen.getByRole('button', { name: /下一页/i });

    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it('shows page info when showInfo is true', () => {
    render(<Pagination currentPage={3} totalPages={10} showInfo={true} />);

    expect(screen.getByText(/第 3 页，共 10 页/i)).toBeInTheDocument();
  });

  it('does not show page info when showInfo is false', () => {
    render(<Pagination currentPage={3} totalPages={10} showInfo={false} />);

    expect(screen.queryByText(/第 3 页/i)).not.toBeInTheDocument();
  });

  it('handles custom maxVisible', () => {
    render(<Pagination currentPage={5} totalPages={20} maxVisible={5} />);

    // Should show limited number of page numbers
    const pageNumbers = screen.getAllByRole('button', { name: /^\d+$/ });
    expect(pageNumbers.length).toBeLessThanOrEqual(5);
  });

  it('handles single page', () => {
    render(<Pagination currentPage={1} totalPages={1} />);

    expect(screen.queryByText('下一页')).not.toBeInTheDocument();
    expect(screen.queryByText('上一页')).not.toBeInTheDocument();
  });

  it('navigates to previous page', async () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);

    const prevButton = screen.getByRole('button', { name: /上一页/i });
    await userEvent.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('navigates to next page', async () => {
    const onPageChange = jest.fn();
    render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChange} />);

    const nextButton = screen.getByRole('button', { name: /下一页/i });
    await userEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(6);
  });
});
