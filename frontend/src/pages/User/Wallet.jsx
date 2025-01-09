import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import ProfileSidebar from '../../components/User/ProfileSidebar'
import { Link, useNavigate } from 'react-router-dom'
import { getWallet } from '../../api/User/Wallet'

const Wallet = () => {

    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(0);
    const navigate = useNavigate();

    const fetchWallet = async () => {
        try {
            setLoading(true);

            const result = await getWallet();

            if (result) {
                setTransactions(result.wallet.transactions);
                setBalance(result.wallet.balance);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchWallet();
    }, [])

  return (
    <div>
      <UserHeader/>

      <nav className="mx-auto w-full mt-4 max-w-[1200px] px-5">
        <ul className="flex items-center">
          <li className="cursor-pointer">
            <Link to="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            </Link>
          </li>

          <li>
            <span className="mx-2 text-gray-500">&gt;</span>
          </li>

          <li onClick={() => navigate('/profile')} className="cursor-pointer text-gray-500">
            Account
          </li>

          <li>
            <span className="mx-2 text-gray-500">&gt;</span>
          </li>

          <li className="cursor-pointer text-gray-500">Wallet</li>
        </ul>
      </nav>

      <section className="container mx-auto w-full flex-grow max-w-[1200px] border-b py-5 lg:flex lg:flex-row lg:py-10">
        <ProfileSidebar />

        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center">
              <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-500">Loading your wallet...</p>
            </div>
          </div>
        ) : (
          <section className="w-full max-w-[1200px] gap-3 px-5 pb-10">
            <div className="border py-5 px-4 shadow-md">
              <h1 className="text-xl font-bold">Wallet Balance</h1>
              <p className="mt-2 text-2xl font-semibold text-green-600">₹{balance}</p>
            </div>

            <div className="my-5  py-5 px-4 shadow-sm">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <table className="hidden w-full md:table mt-5">
                <thead className="h-16 bg-neutral-100 ">
                  <tr>
                    <th className="text-left px-4">DATE</th>
                    <th className="text-left">DESCRIPTION</th>
                    <th className="text-center">TYPE</th>
                    <th className="text-right px-4">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length ? (
                    transactions.map((txn) => (
                      <tr key={txn._id} className="h-[100px] border-b">
                        <td className="align-middle px-4">{new Date(txn.date).toLocaleDateString()}</td>
                        <td className="align-middle">{txn.description}</td>
                        <td className="text-center align-middle">
                          <span
                            className={`font-bold ${
                              txn.type === 'credit'
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {txn.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-right align-middle px-4">₹{txn.amount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-gray-500">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>

      <UserFooter/>
    </div>

  )
}

export default Wallet
