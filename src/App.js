import "./App.css";
import Barchart from "./components/Barchart";
import Text from "./components/Text";

function App() {
  return (
    <div className="container px-4">
      <Text />
      <div className="container">
        <Barchart />
      </div>
    </div>
  );
}

export default App;
