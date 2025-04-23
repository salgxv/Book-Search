import React, { useState } from 'react';
import { Form, Button, Col, Row, Card, Container } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../graphql/mutations';
import Auth from '../utils/auth';
import { saveBookId, getSavedBookIds } from '../utils/localStorage';

const SearchBooks: React.FC = () => {
  const [searchedBooks, setSearchedBooks] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook] = useMutation(SAVE_BOOK);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) return;

    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`);
      if (!response.ok) throw new Error('Something went wrong!');

      const { items } = await response.json();

      const bookData = items.map((book: any) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        link: book.volumeInfo.infoLink,
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    if (!bookToSave) return;

    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return;

    try {
      await saveBook({ variables: { input: bookToSave } });
      const updatedSavedBookIds = [...savedBookIds, bookId];
      setSavedBookIds(updatedSavedBookIds);
      saveBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Container className="pt-5">
        <h1>Search for Books!</h1>
        <Form onSubmit={handleFormSubmit}>
          <Row>
            <Col xs={9}>
              <Form.Control
                name="searchInput"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type="text"
                placeholder="Search for a book"
              />
            </Col>
            <Col xs={3}>
              <Button type="submit" variant="success" disabled={!searchInput}>
                Search
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>

      <Container className="py-5">
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => (
            <Col md="4" key={book.bookId} className="mb-3">
              <Card border="dark">
                {book.image && <Card.Img src={book.image} alt={`Cover for ${book.title}`} top />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds.includes(book.bookId)}
                      onClick={() => handleSaveBook(book.bookId)}
                      className="btn-block btn-info"
                    >
                      {savedBookIds.includes(book.bookId)
                        ? 'Book Already Saved'
                        : 'Save This Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;