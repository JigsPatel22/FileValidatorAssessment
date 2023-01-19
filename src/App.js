/* Entry point to the application */
import React from 'react';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import FileValidator from './components/FileValidator';
 
function App() {
  return (
    <div>
      {/* FileValidator component imported inside main application */}
      <FileValidator />
    </div>
  );
}
 
export default App;
