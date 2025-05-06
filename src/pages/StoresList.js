import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStores, reset } from '../redux/slices/storeSlice';
import StoreItem from '../components/StoreItem';
import Spinner from '../components/Spinner';

const StoresList = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');

  const { stores, isLoading, isError, message } = useSelector(
    (state) => state.stores
  );

  useEffect(() => {
    dispatch(getStores());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  if (isLoading) {
    return <Spinner />;
  }

  // Filter stores based on search term
  const filteredStores = stores.filter((store) => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <section className="heading">
        <h1>Stores</h1>
        <p>Browse all registered stores</p>
      </section>

      <section className="search">
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            id="search"
            placeholder="Search by name or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="content">
        {stores.length === 0 ? (
          <h3>No stores found</h3>
        ) : (
          <div className="stores">
            {filteredStores.map((store) => (
              <StoreItem key={store._id} store={store} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default StoresList; 