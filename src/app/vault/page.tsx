'use client';

import Image from "next/image";
import { useState } from "react";

export default function Vault() {
    const [selectedName, setSelectedName] = useState('');
    const [selectedEmail, setSelectedEmail] = useState('');
    const [selectedUrl, setSelectedUrl] = useState('');
    const [selectedPassword, setSelectedPassword] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(-1);
    const [data, setData] = useState([
        {
            name: 'University of Michigan',
            email: 'ryanhopk@umich.edu',
            url: 'umich.edu',
            password: 'password123'
        },
        {
            name: 'Netflix',
            email: 'ryanhopk@umich.edu',
            url: 'netflix.com',
            password: 'badpassword4321'
        }
    ]);

    return (
        <main className="flex justify-center">
            {(selectedEntry === -1) ?
                <div>
                    <div className="bg-light-purple px-6 py-2 w-80 rounded-3xl w-96 mb-10">
                        <Image
                            src="/searchicon.png"
                            width={39}
                            height={36}
                            className="inline"
                            alt="Search icon"
                        ></Image>
                    </div>
                    <div>
                        <ul>
                            {
                                data.map((entry, i) =>
                                    <li
                                        key={i}
                                        className="w-96 light-purple-underline p-2 cursor-pointer"
                                        onClick={() => {
                                            setSelectedEntry(i);
                                            setSelectedName(data[i].name);
                                            setSelectedEmail(data[i].email);
                                            setSelectedUrl(data[i].url);
                                            setSelectedName(data[i].name);
                                        }}>
                                        {entry.name}
                                        <Image
                                            src="/rarrow.png"
                                            width={35}
                                            height={35}
                                            className="float-right"
                                            alt="Search icon"
                                        ></Image>
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                    <button onClick={() => {
                        setSelectedName('');
                        setSelectedEmail('');
                        setSelectedPassword('');
                        setSelectedUrl('');
                        setSelectedEntry(data.length);
                    }} className="block button bg-dark-purple m-3 w-80 px-6 py-2 rounded-3xl text-white font-bold cursor-pointer">Add new account</button>
                </div> :
                <div>
                    <form onSubmit={(e) => {
                        e.preventDefault();

                        if (selectedEntry == data.length) {
                            setData([
                                ...data,
                                {
                                    name: selectedName,
                                    email: selectedEmail,
                                    url: selectedUrl,
                                    password: selectedPassword
                                }
                            ]);
                        } else {
                            setData(data.map((e, i) => {
                                if (i === selectedEntry) {
                                    return {
                                        name: selectedName,
                                        email: selectedEmail,
                                        url: selectedUrl,
                                        password: selectedPassword
                                    }
                                } else {
                                    return e;
                                }
                            }));
                        }

                        setSelectedEntry(-1);
                    }}>
                        <div>
                            <Image
                                src="/larrow.png"
                                width={35}
                                height={35}
                                className="inline cursor-pointer"
                                alt="Search icon"
                                onClick={() => setSelectedEntry(-1)}
                            ></Image>
                            <input
                                className="my-8 text-xl"
                                type="text"
                                placeholder="Account name"
                                value={selectedName}
                                onChange={(e) => setSelectedName(e.target.value)}>
                            </input>
                        </div>

                        <label htmlFor="email" className="block mx-8">Email</label>
                        <input
                            className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                            placeholder="Email"
                            id="email"
                            name="email"
                            onChange={(e) => { setSelectedEmail(e.target.value) }}
                            value={selectedEmail}
                        ></input>

                        <label htmlFor="password" className="block mx-8">Password</label>
                        <input
                            className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                            placeholder="Password"
                            id="password"
                            name="password"
                            onChange={(e) => { setSelectedPassword(e.target.value) }}
                            value={selectedPassword}
                        ></input>

                        <label htmlFor="website" className="block mx-8">URL</label>
                        <input
                            className="block bg-light-purple m-3 px-6 py-2 w-80 rounded-3xl"
                            placeholder="Website"
                            id="website"
                            name="website"
                            onChange={(e) => { setSelectedUrl(e.target.value) }}
                            value={selectedUrl}
                        ></input>

                        <input type="submit" className="block button bg-dark-purple m-3 px-6 py-2 w-80 rounded-3xl text-white font-bold cursor-pointer" value="Save"></input>
                    </form>
                </div>
            }
        </main>
    )
}