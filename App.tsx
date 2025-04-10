import React, { useState, useCallback } from 'react';

interface KeyValue {
  id: number;
  key: string;
  value: string;
}

const ApiBuilder: React.FC = () => {
  const [apiUrl, setApiUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [apiMethod, setApiMethod] = useState<string>('GET');
  const [queryParams, setQueryParams] = useState<KeyValue[]>([]);
  const [headers, setHeaders] = useState<KeyValue[]>([{ id: Date.now(), key: 'Content-Type', value: 'application/json' }]);
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const methodsWithBody = ['POST', 'PUT', 'PATCH'];

  // --- Query Params Handlers ---
  const addQueryParam = () => {
    setQueryParams([...queryParams, { id: Date.now(), key: '', value: '' }]);
  };

  const updateQueryParam = (id: number, field: 'key' | 'value', value: string) => {
    setQueryParams(
      queryParams.map((param) => (param.id === id ? { ...param, [field]: value } : param))
    );
  };

  const removeQueryParam = (id: number) => {
    setQueryParams(queryParams.filter((param) => param.id !== id));
  };

  // --- Headers Handlers ---
  const addHeader = () => {
    setHeaders([...headers, { id: Date.now(), key: '', value: '' }]);
  };

  const updateHeader = (id: number, field: 'key' | 'value', value: string) => {
    setHeaders(
      headers.map((header) => (header.id === id ? { ...header, [field]: value } : header))
    );
  };

  const removeHeader = (id: number) => {
    setHeaders(headers.filter((header) => header.id !== id));
  };

  // --- Test API Handler ---
  const handleTestApi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    let finalUrl = apiUrl;
    if (queryParams.length > 0) {
      const filteredParams = queryParams.filter(param => param.key.trim() !== '');
      if (filteredParams.length > 0) {
        const queryString = new URLSearchParams(
          filteredParams.reduce((acc, param) => {
            acc[param.key] = param.value;
            return acc;
          }, {} as Record<string, string>)
        ).toString();
        finalUrl += `?${queryString}`;
      }
    }


    const requestHeaders = new Headers();
    headers.forEach(header => {
      if (header.key.trim() !== '') {
        requestHeaders.append(header.key, header.value);
      }
    });

    const requestOptions: RequestInit = {
      method: apiMethod,
      headers: requestHeaders,
    };

    if (methodsWithBody.includes(apiMethod) && requestBody.trim() !== '') {
      requestOptions.body = requestBody;
    }

    try {
      const res = await fetch(finalUrl, requestOptions);
      const data = await res.json();
      setResponse(JSON.stringify({ status: res.status, statusText: res.statusText, data: data }, null, 2));
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      setResponse(null); // Clear response on error
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, apiMethod, queryParams, headers, requestBody]);

  // --- Export Handler ---
  const handleExport = () => {
    const apiConfig = {
      apiUrl,
      apiMethod,
      queryParams: queryParams.filter(p => p.key.trim()),
      headers: headers.filter(h => h.key.trim()),
      requestBody: methodsWithBody.includes(apiMethod) ? requestBody : undefined,
    };
    const dataStr = JSON.stringify(apiConfig, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'api-config.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
  };

  // --- Load Example Handler ---
    const loadExample = () => {
        setApiUrl('https://jsonplaceholder.typicode.com/posts');
        setApiMethod('POST');
        setQueryParams([]);
        setHeaders([
            { id: Date.now(), key: 'Content-Type', value: 'application/json' },
            { id: Date.now() + 1, key: 'Authorization', value: 'Bearer YOUR_TOKEN_HERE' } // Example header
        ]);
        setRequestBody(JSON.stringify({
            title: 'foo',
            body: 'bar',
            userId: 1,
        }, null, 2));
        setResponse(null);
        setError(null);
    };


  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">API Builder & Tester</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request Configuration Panel */}
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Request Configuration</h2>

          {/* URL and Method */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-none w-full sm:w-auto">
              <label htmlFor="apiMethod" className="block text-sm font-medium text-gray-600 mb-1">Method</label>
              <select
                id="apiMethod"
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
                className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
                <option>OPTIONS</option>
                <option>HEAD</option>
              </select>
            </div>
            <div className="flex-grow">
              <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-600 mb-1">API Endpoint URL</label>
              <input
                type="text"
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/users"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

           {/* Load Example Button */}
          <div className="pt-2">
             <button
                onClick={loadExample}
                className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
                Load Example Request
            </button>
          </div>


          {/* Query Parameters */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-600">Query Parameters</h3>
            {queryParams.map((param, index) => (
              <div key={param.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={param.key}
                  onChange={(e) => updateQueryParam(param.id, 'key', e.target.value)}
                  className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => updateQueryParam(param.id, 'value', e.target.value)}
                  className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeQueryParam(param.id)}
                  className="px-2 py-1 text-red-500 hover:text-red-700 text-sm font-medium"
                  aria-label="Remove parameter"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={addQueryParam}
              className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
            >
              + Add Param
            </button>
          </div>

          {/* Headers */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-gray-600">Headers</h3>
            {headers.map((header, index) => (
              <div key={header.id} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Header Name"
                  value={header.key}
                  onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                  className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Header Value"
                  value={header.value}
                  onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                  className="flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => removeHeader(header.id)}
                   className="px-2 py-1 text-red-500 hover:text-red-700 text-sm font-medium"
                   aria-label="Remove header"
                >
                   &times;
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
            >
              + Add Header
            </button>
          </div>

          {/* Request Body (Conditional) */}
          {methodsWithBody.includes(apiMethod) && (
            <div className="space-y-2">
              <label htmlFor="requestBody" className="block text-md font-semibold text-gray-600">Request Body (JSON)</label>
              <textarea
                id="requestBody"
                rows={6}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder='{ "key": "value" }'
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t mt-4">
            <button
              onClick={handleTestApi}
              disabled={isLoading}
              className={`flex-grow px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLoading
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Testing...' : 'Test API'}
            </button>
            <button
              onClick={handleExport}
              className="flex-grow px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Export Config
            </button>
          </div>
        </div>

        {/* Response Panel */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
           <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Response</h2>
           {isLoading && (
             <div className="flex items-center justify-center text-gray-500">
                <svg className="animate-spin mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                Loading response...
             </div>
           )}
            {error && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-md text-sm">
                    <p className="font-medium">Error:</p>
                    <pre className="whitespace-pre-wrap break-all mt-1">{error}</pre>
                </div>
            )}
            {response && (
                <div className="bg-gray-100 border border-gray-200 rounded-md p-4">
                     <h3 className="text-md font-semibold text-gray-600 mb-2">Response Data:</h3>
                     <pre className="text-sm text-gray-800 whitespace-pre-wrap break-all overflow-auto max-h-96 font-mono bg-white p-3 rounded border border-gray-300">
                         {response}
                    </pre>
                 </div>
             )}
             {!isLoading && !error && !response && (
                 <div className="text-center text-gray-500 italic py-10">
                     Send a request to see the response here.
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default ApiBuilder;