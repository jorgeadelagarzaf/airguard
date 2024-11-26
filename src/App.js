import logo from './assets/logo.png';
import './App.css';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import MainPage from './pages/Main';
import CuartoPage from './pages/Cuarto';
import AjustesPage from './pages/Ajustes';

function App() {
  return (
    <div className="App w-100">
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-800">
          {/* NavBar */}
          <nav className="bg-blue-600 text-white shadow-md  sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <img
                  src={logo} // Replace with your logo path
                  alt="Logo"
                  className="h-10 w-10 mr-3"
                />
                <span className="text-2xl font-bold">
                  <NavLink to="/" className="hover:text-blue-300">
                    AirGuard
                  </NavLink>
                </span>
              </div>

              {/* Navigation Links */}
              <ul className="flex space-x-6">
                <li>
                  <NavLink
                    to="/"
                    className={({ isActive }) =>
                      `hover:text-blue-300 ${isActive ? 'underline' : ''}`
                    }
                  >
                    Inicio
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/cuarto/1"
                    className={({ isActive }) =>
                      `hover:text-blue-300 ${isActive ? 'underline' : ''}`
                    }
                  >
                    Cuarto 1
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/cuarto/2"
                    className={({ isActive }) =>
                      `hover:text-blue-300 ${isActive ? 'underline' : ''}`
                    }
                  >
                    Cuarto 2
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/cuarto/3"
                    className={({ isActive }) =>
                      `hover:text-blue-300 ${isActive ? 'underline' : ''}`
                    }
                  >
                    Cuarto 3
                  </NavLink>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-screen flex flex-col items-center text-white">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/cuarto/:id" element={<CuartoPage />} />
              <Route path="/ajustes" element={<AjustesPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-gray-800 text-white text-center py-4">
            &copy; {new Date().getFullYear()} Tec de Monterrey
          </footer>
        </div>
      </Router>
    </div>
  );
}

export default App;
