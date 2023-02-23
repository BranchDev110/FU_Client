import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className='flex min-h-screen px-4 bg-gray-800'>
            <div className='flex-1 items-center py-60'>
                <p className='text-[80px] text-gray-200'>HP-Notes</p>
                <p className='text-lg text-white my-4'>Simple & Easy Managed Notes App</p>
                <Link to="/main">Go to Main Page</Link>
            </div>
            <button></button>
        </div>
    )
}

export default Home;