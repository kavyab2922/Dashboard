import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/appRoutes";

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
