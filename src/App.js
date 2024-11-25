import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseUrl = process.env.REACT_APP_BASEURL;

function App() {
  const [url, setUrl] = useState("");
  const [insights, setInsights] = useState([]);
  const [previousLinks, setPreviousLinks] = useState([]);
  const [error, setError] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [loader, setloader] = useState(false);


  const fetchInsights = async () => {

    const response = await axios.get(`${baseUrl}/api/insights`);
    setInsights(response.data);
console.log(response.data,'response.data');

    const links = response.data.map((insight) => insight?.url);
    setPreviousLinks(links);
    setLoading(false);

  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const validateURL = (url) => {
    const regex = new RegExp(
      "^(https?:\\/\\/)?" + 
      "((([a-zA-Z\\d](([a-zA-Z\\d-]*)[a-zA-Z\\d])?)\\.)+[a-zA-Z]{2,}|" + 
      "localhost|" + 
      "\\d{1,3}(\\.\\d{1,3}){3})" + 
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + 
      "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + 
      "(\\#[-a-zA-Z\\d_]*)?$",
      "i"
    );
    return regex.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateURL(url)) {
      setError("Please enter a valid URL.");
      return;
    }
    setError("");
    setloader(true);

    try{

      const response = await axios.post(`${baseUrl}/api/insights`, { url });
      setInsights([response.data, ...insights]);
      setUrl("");
  
      setPreviousLinks([response.data.url, ...previousLinks]);
      toast.success("URL submitted successfully!");
      setloader(false);
    }  catch (error) {
      toast.error("Failed to submit URL. Please try again.");
    } 
  };

  const handleRemove = async (id) => {
    await axios.delete(`${baseUrl}/api/insights/${id}`);
    toast.success("Insight removed successfully!");
    fetchInsights();
  };

  const handleFavorite = async (id, isFavorite) => {
    await axios.put(`${baseUrl}/api/insights/${id}/favorite`, { isFavorite: !isFavorite });
    toast.success("Status updated successfully");
    fetchInsights();
  };

  return (
    <div className="app-container">
       <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="app-title">Word Count App</h1>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="url-input"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
     <button type="submit" className="submit-button" disabled={loader}>
  {loader ? "Submitting..." : "Check Word Count"}
</button>

        {error && <p className="error-message">{error}</p>}
      </form>

      <div className="insights-wrapper">
        <table className="insights-table">
          <thead>
            <tr>
              <th>URL</th>
              <th>Word Count</th>
              <th>Favorite</th>
              <th>Web Links</th>
              <th>Media Links</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading?<>Loading</>:<>
            {insights.map((insight,index) => (
              <tr key={insight._id}>
                <td>{insight?.url}</td>
                <td>{insight?.wordCount}</td>
                <td>{insight?.isFavorite ? 
                "true" : "false"}</td>
                <td>
                  <ul>
                  <td>
                  <ul>
  {previousLinks
    .filter((_, idx) => idx > index) 
    .map((link, idx) => (
      <li key={idx}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
        </a>
      </li>
    ))}
</ul>


</td>

                  </ul>
                </td>
                <td>
                  <ul>
                    {insight?.media?.images.map((link, idx) => (
                      <li key={idx}>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <ul>
                    {insight?.media?.videos.map((link, idx) => (
                      <li key={idx}>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
  <button
    className={`favorite-button ${insight?.isFavorite ? "unfavorite" : "favorite"}`}
    onClick={() => handleFavorite(insight._id, insight.isFavorite)}
  >
    {insight?.isFavorite ? "Unfavorite" : "Favorite"}
  </button>
  <br/>
  <button
    className="remove-button"
    onClick={() => handleRemove(insight._id)}
  >
    Remove
  </button>
</td>

              </tr>
            ))}
            </>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
