import { Layout } from "@/components/layout";
import {
  BoardDetailPage,
  BoardsPage,
  HomePage,
  LoginPage,
  TaskDetailPage,
  TasksPage,
} from "@/pages";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks",
  component: TasksPage,
});

const taskDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tasks/$taskId",
  component: TaskDetailPage,
});

const boardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/boards",
  component: BoardsPage,
});

const boardDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/boards/$boardId",
  component: BoardDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  tasksRoute,
  taskDetailRoute,
  boardsRoute,
  boardDetailRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
