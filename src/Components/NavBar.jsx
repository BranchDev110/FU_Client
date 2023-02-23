import React from 'react';

const NavBar = () => {
    return (        
        <nav class="bg-white border-gray-200 px-2 py-4 rounded shadow-sm">
            <div class="container flex flex-wrap items-center justify-end mx-auto">
                <div class="flex items-center md:order-2">
                    <button type="button" class="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
                        <span class="sr-only">Open user menu</span>
                        <img class="w-8 h-8 rounded-full" src="logo192.png" alt="user"/>
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default NavBar;