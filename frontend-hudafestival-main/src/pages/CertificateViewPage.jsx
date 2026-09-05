import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const CertificatePage = () => {
    const { resultId, programmeId } = useParams(); // Get IDs from the URL
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResultData = async () => {
            try {
                setLoading(true);
                // We need to fetch the full result data to display it
                const res = await api.get(`/programmes/${programmeId}/results`);
                const allResults = res.data;
                const specificResult = allResults.find(r => r._id === resultId);
                
                if (specificResult) {
                    const candRes = await api.get(`/candidates/${specificResult.candidate}`);
                    const progRes = await api.get(`/programmes/${programmeId}`);
                    setResult({ 
                        ...specificResult, 
                        candidate: candRes.data, 
                        programme: progRes.data 
                    });
                } else {
                     setError('Certificate data not found.');
                }
            } catch (err) {
                setError('Failed to load certificate data.');
            } finally {
                setLoading(false);
            }
        };
        fetchResultData();
    }, [resultId, programmeId]);

    if (loading) return <div className="text-center p-10">Loading Certificate...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    const downloadUrl = `${api.defaults.baseURL}/programmes/${programmeId}/results/${resultId}/certificate`;

    return (
        <div className="container mx-auto p-4 md:p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Certificate of Achievement</h1>
            <p className="mt-2 text-lg text-gray-600">This certificate is awarded to</p>
            
            <div className="my-8">
                <h2 className="text-5xl font-extrabold text-blue-600">{result?.candidate.name}</h2>
                <p className="mt-4 text-xl text-gray-700">for their participation in</p>
                <h3 className="text-3xl font-bold text-gray-800">{result?.programme.name}</h3>
            </div>
            
            <a 
                href={downloadUrl}
                download
                className="inline-block px-8 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700"
            >
                Download PDF Certificate
            </a>

            <div className="mt-8">
                <Link to={`/programmes/${programmeId}/results`} className="text-sm text-blue-600 hover:underline">
                    &larr; Back to Results
                </Link>
            </div>
        </div>
    );
};

export default CertificatePage;
