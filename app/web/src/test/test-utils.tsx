import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

// Create a new QueryClient for each test
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllTheProvidersProps {
  children: ReactNode;
}

export function createWrapper(queryClient?: QueryClient) {
  const client = queryClient || createTestQueryClient();

  return function AllTheProviders({ children }: AllTheProvidersProps) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options || {};
  const wrapper = createWrapper(queryClient);

  return {
    ...render(ui, { wrapper, ...renderOptions }),
    queryClient: queryClient || createTestQueryClient(),
  };
}

export * from "@testing-library/react";
