import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, {useState} from 'react';
import NavBar from '../Components/NavBar';
import NoteItem from '../Components/NoteItem';
import SideBar from '../Components/SideBar';
import { faAdd, faRemove } from '@fortawesome/free-solid-svg-icons';
import CreateNote from '../Components/CreateNote';

const Dashboard = () => {
    const [isShowAddModal, setIsShowAddModal] = useState(false);

    const handleAddNotes = () => {
        setIsShowAddModal(true);
    }

    const handleClose = () => {
        setIsShowAddModal(false);
    }

    return (
        <>
            <div className='flex bg-gray-50'>
                <SideBar />
                <div className='flex flex-col flex-1'>
                    <NavBar />
                    <div className='flex-1 p-8'>
                        <div className='flex justify-between'>
                            <h2 className='text-gray-700 text-4xl font-bold'>Notes</h2>
                            <div className='control'>
                                <button className="bg-blue-700 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-2 rounded" type="button" onClick={handleAddNotes}>
                                <FontAwesomeIcon icon={faAdd} /> Add Notes
                                </button>
                                <button class="bg-blue-700 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-2 rounded">
                                    <FontAwesomeIcon icon={faRemove} /> Remove Notes
                                </button>
                            </div>
                        </div>
                        <div className='bg-white p-5 my-5 shadow-sm'>
                            <form className='w-96'>
                                <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <input type="search" id="default-search" class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
                                    <button type="submit" class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2">Search</button>
                                </div>
                            </form>
                        </div>
                        <div className='grid grid-cols-3 gap-4 overflow-y-auto h-[550px]'>
                            {
                                new Array(10).fill(0).map(item => <NoteItem />)
                            }
                        </div>
                    </div>
                </div>
            </div>
            {
                isShowAddModal ? <CreateNote closeModal={handleClose}/> : null
            }
        </>
    )
}

export default Dashboard;