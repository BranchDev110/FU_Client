import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faClock, faThumbsUp } from '@fortawesome/free-solid-svg-icons'

const NoteItem = () => {
    return (
        <div className='note__item__container bg-white shadow-sm relative'>
            <div className='note__item__title flex flex-col items-center py-5'>
                <img src="product_1.png" width={50}/>
                <p className='text-gray-800 text-2xl font-bold'>Resume</p>
            </div>
            <div className='note__item__details flex absolute right-0 top-0 p-5 text-gray-500'>
                <div className='note__item__date__info flex items-center mr-3'>
                    <FontAwesomeIcon icon={faThumbsUp} className="text-xl"/>
                    <p className='note__item__created text-[14px] ml-2'>110</p>
                </div>
                <div className='note__item__date__info flex items-center'>
                    <FontAwesomeIcon icon={faDownload} className="text-xl"/>
                    <p className='note__item__modified text-[14px] ml-2'>594</p>
                </div>
            </div>
            <div className='note__item__description px-4 pb-8'>
                <p className='text-gray-600'>
                    Resume by Steven Fredericks. It covers my work history, education history and certificates.
                </p>
            </div>
            <div className='note__item__details flex justify-between p-5 border-t-2 text-gray-500'>
                <div className='note__item__date__info flex items-center'>
                    <FontAwesomeIcon icon={faClock} className="text-xl"/>
                    <p className='note__item__created text-[14px] ml-2'>Updated 2 hours ago</p>
                </div>
                <div className='note__item__date__info flex items-center'>
                    <FontAwesomeIcon icon={faClock} className="text-xl"/>
                    <p className='note__item__created text-[14px] ml-2'>Created 2 hours ago</p>
                </div>
            </div>
        </div>
    )
}

export default NoteItem;