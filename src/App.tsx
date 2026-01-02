import React, { useState, useCallback, useRef } from 'react';
import debounce from 'lodash/debounce';
import './App.scss';
import { peopleFromServer } from './data/people';
import type { Person } from './types/Person';
import type { Props } from './types/Props';

export const App: React.FC<Props> = ({ onSelected, delay = 300 }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPeople, setFilteredPeople] = useState(peopleFromServer);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [lastSearchedQuery, setLastSearchedQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query === lastSearchedQuery) {
        return;
      }

      setSearchQuery(query);
      setLastSearchedQuery(query);

      if (query.trim() === '') {
        setFilteredPeople(peopleFromServer);
      } else {
        const filtered = peopleFromServer.filter(person =>
          person.name.toLowerCase().includes(query.toLowerCase()),
        );

        setFilteredPeople(filtered);
      }
    }, delay),
    [delay, lastSearchedQuery],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;

      debouncedSearch(query);
    },
    [debouncedSearch],
  );

  const handleSelectPerson = useCallback(
    (person: Person) => {
      setSelectedPerson(person);
      if (inputRef.current) {
        inputRef.current.value = person.name;
      }

      onSelected?.(person);
    },
    [onSelected],
  );

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div className={`dropdown ${isFocused ? 'is-active' : ''}`}>
          <div className="dropdown-trigger">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              {filteredPeople.map(person => (
                <div
                  key={person.slug}
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onMouseDown={() => handleSelectPerson(person)}
                >
                  <p
                    className={
                      person.sex === 'm' ? 'has-text-link' : 'has-text-danger'
                    }
                  >
                    {person.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {filteredPeople.length === 0 && searchQuery.trim() !== '' && (
          <div
            className="
              notification
              is-danger
              is-light
              mt-3
              is-align-self-flex-start
            "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
