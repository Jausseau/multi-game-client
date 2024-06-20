import { createBrowserRouter } from "react-router-dom";
import TicTacToe from "./components/TicTacToe";
import Root from "./pages/Root";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const gamesRoutes = [
  {
    path: "/tic-tac-toe",
    element: <TicTacToe />,
    name: "Tic Tac Toe",
    Icon: XMarkIcon,
  },
];

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: gamesRoutes,
  },
]);
