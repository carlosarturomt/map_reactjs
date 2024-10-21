import ErrorBoundary from "./utils/ErrorBoundary";
import { UserDataProvider } from "./context/userDataContext";
import { Routes } from "./routes";


function App() {

    return (
        <ErrorBoundary>
            <UserDataProvider>
                <Routes />
            </UserDataProvider>
        </ErrorBoundary>
    )
}

export default App;