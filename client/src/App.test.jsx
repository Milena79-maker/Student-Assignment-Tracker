// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

vi.stubGlobal('fetch', vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
));

describe('Student Assignment Tracker', () => {
  it('opens the Add Assignment form when clicked', async () => {
    render(<App />);

    const addButton = screen.getAllByRole('button', {
  name: /add assignment/i
})[0];

    fireEvent.click(addButton);

    expect(
      screen.getByRole('heading', {
        name: 'Add Assignment'
      })
    ).toBeTruthy();

    expect(
      screen.getByPlaceholderText('e.g. React portfolio project')
   ).toBeTruthy();
  });
  it('displays the Home Dashboard', () => {
  render(<App />);

  expect(
    screen.getByText('Make every deadline')
  ).toBeTruthy();

  expect(
    screen.getByText('Total Assignments')
  ).toBeTruthy();
});
it('opens the Assignments page when clicked', () => {
  render(<App />);

  const assignmentsButton = screen.getAllByRole('button', {
  name: 'Assignments'
})[0];

  fireEvent.click(assignmentsButton);

  expect(
    screen.getByRole('heading', {
      name: 'My Assignments'
    })
  ).toBeTruthy();
});
it('displays the assignment search box', () => {
  render(<App />);

  const assignmentsButton = screen.getAllByRole('button', {
    name: 'Assignments'
  })[0];

  fireEvent.click(assignmentsButton);

  expect(
    screen.getByRole('textbox', {
      name: 'Search assignments'
    })
  ).toBeTruthy();
});
it('allows students to select the Completed filter', () => {
  render(<App />);

  const assignmentsButton = screen.getAllByRole('button', {
    name: 'Assignments'
  })[0];

  fireEvent.click(assignmentsButton);

  const completedButton = screen.getByRole('button', {
    name: 'Completed'
  });

  fireEvent.click(completedButton);

  expect(completedButton.className).toContain('selected');
});
});