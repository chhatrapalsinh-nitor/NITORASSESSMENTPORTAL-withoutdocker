import React from "react";
// import  useFetch  from "../Utils/Hooks/useFetchAPI";

const CandidateTest = () => {
    return (<h1>Candidate test Page</h1>)
    
/*
To test the custom Hook for API call
    const { isLoading, serverError, apiData } = useFetch(
       "/posts/1",
      );
      return (
        <div>
          <h2>API data</h2>
          {isLoading && <span>Loading.....</span>}
          {!isLoading && serverError ? (
            <span>Error in fetching data ...</span>
          ) : (
            <span>{JSON.stringify(apiData)}</span>
          )}
        </div>
      );
      */
}
export default CandidateTest;