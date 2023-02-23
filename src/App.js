import { Routes, Route } from 'react-router-dom';
import './App.css';
import { ProtectedRoute } from './Components/ProtectedRoute';
import Dashboard from './Page/Dashboard';
import Home from './Page/Home';
import Login from './Page/Login';
import Register from './Page/Register';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={ <Home/> }/>
        <Route path='/login' element={ <Login/> }/>
        <Route path='/register' element={ <Register/> }/>
        <Route path='/main' element={ 
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }/>
      </Routes>
    </div>
  );
}

export default App;
