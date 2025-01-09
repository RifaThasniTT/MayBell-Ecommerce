import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import ProductCard from '../../components/User/ProductCard'
import { useNavigate } from 'react-router-dom'
import { getListedCategories, getListedProducts } from '../../api/User/Products'

const AllProducts = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSort, setSelectedSort] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setLoading(true); 
        const categoryResult = await getListedCategories();
        setCategories(categoryResult);

        const productResult = await getListedProducts({
          categories: selectedCategories,
          sort: selectedSort, 
          search: searchTerm,
        });
        
        setProducts(productResult);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
      
    };

    fetchCategoriesAndProducts();
  }, [selectedCategories, selectedSort, searchTerm]);

  return (
    <div>
      <UserHeader/>

      <nav className="mx-auto w-full mt-4 max-w-[1200px] px-5">
      <ul className="flex items-center">
        <li className="cursor-pointer">
          <a onClick={() => navigate('/')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </a>
        </li>
        <li>
          <span className="mx-2 text-gray-500">&gt;</span>
        </li>
        <li onClick={() => navigate('/all-products')} className="text-gray-500">Catalog</li>
      </ul>
    </nav>

    <section className="container mx-10 flex-grow max-w-[1200px] border-b py-5 lg:flex lg:flex-row lg:py-10">
      {/* Sidebar */}
      <section className="hidden w-[300px] flex-shrink-0 px-4 lg:block">
        {/* Categories Section */}
        <div className="flex border-b pb-5">
          <div className="w-full">
            <p className="mb-4 font-medium">CATEGORIES</p>

            { loading ? (
              <div className="flex items-center justify-center h-[100px]">
              <div className="text-center">
                <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
                <p className="mt-3 text-gray-500">Loading...</p>
              </div>
            </div>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="flex mb-1 w-full justify-between">
                  <div className="flex justify-center items-center">
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedCategories((prev) =>
                          checked 
                            ? [...prev, category._id]
                            : prev.filter((c) => c !== category._id) 
                        )
                      }} 
                    />
                    <p className="ml-4">{category.name}</p>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* Sort Section */}
        <div className="flex border-b py-5">
          <div className="w-full">
            <p className="mb-4 font-medium">SORT BY</p>

            {[
              { id: 'popularity', label: 'Popularity' },
              { id: 'new-arrivals', label: 'New Arrival' },
              { id: 'price-asc', label: 'Price: Low to High' },
              { id: 'price-desc', label: 'Price: High to Low' },
              { id: 'a-z', label: 'Aa - Zz' },
              { id: 'z-a', label: 'Zz - Aa' },
            ].map((option) => (
              <div key={option.id} className="flex mb-1 w-full justify-between">
                <div className='flex justify-center items-center'>
                  <input 
                    type="radio" 
                    name='sort'
                    id={option.id}
                    checked={selectedSort === option.id}
                    onChange={() => setSelectedSort(option.id)}
                  />
                  <label htmlFor={option.id} className='ml-4'>
                    {option.label}
                  </label>
                </div>
              </div>
            ))}

          </div>
        </div>

        <button
          className="mt-4 text-sm bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
          onClick={() => {
            setSelectedCategories([]); 
            setSelectedSort(''); 
            setSearchTerm(''); 
          }}
        >
          Clear All Filters
        </button>

      </section>

      <div>
      <div className="mb-10 flex items-center justify-center px-2">
        {/* Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setSearchTerm(e.target.search.value);
          }}
          className=" h-9 w-4/5 items-center border md:flex"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-3 h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            className="hidden w-11/12 outline-none md:block"
            type="search"
            placeholder="Search"
            name='search'
          />
          <button 
            type='submit'
            className="ml-auto h-full bg-amber-400 px-4 hover:bg-yellow-300"
          >
            Search
          </button>
        </form>

        
      </div>



      <section className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 pl-6 pb-10 lg:grid-cols-4">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
          <div className="text-center">
            <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-500">Loading...</p>
          </div>
        </div>
        ) : products.length === 0 ? (
          <p>No products are found.</p>  
        ) : (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </section>


    </div>
    </section>

      <UserFooter/>
    </div>
  )
}

export default AllProducts
