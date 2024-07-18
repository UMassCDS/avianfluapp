import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { WrappedApp, App } from './App';

/* This is where the app would normally be tested. Unfortunately, I did not have the time to get to it. Ideally, React testing tests the actual rendering and functionslity of the frontend code. Any calls to the backend can be mocked using Jest. 
https://jestjs.io/docs/tutorial-react
*/ 

// TODO: add tests for the application. 


describe('App', () => {
  it('Renders hello world', () => {
    // ARRANGE
    render(<WrappedApp />);
    // ACT
    // EXPECT
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Home Page'
    );
  });

  it('Renders not found if the path is invalid', () => {
    render(
      <MemoryRouter initialEntries={['/invalidPath']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '404 Page Not Found'
    );
  });
});
