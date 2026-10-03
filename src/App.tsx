/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AppStateProvider } from './app/app-context';
import { queryClient } from './app/query-client';
import { router } from './app/router';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </QueryClientProvider>
  );
}
