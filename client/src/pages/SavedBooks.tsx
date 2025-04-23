import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { REMOVE_BOOK } from '../graphql/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK, {
    refetchQueries: [{ query: GET_ME }],
  });

  const userData = data?.me || { savedBooks: [] };

  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) return false;

    try {
      await removeBook({ variables: { bookId } });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <h2>LOADING...</h2>;

  return (
    <Container>
      <h1 className="pt-5">Viewing saved books:</h1>
      <h2 className="pb-3">
        {userData.savedBooks.length
          ? `You have ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
          : 'You have no saved books.'}
      </h2>
      <Row>
        {userData.savedBooks.map((book: any) => (
          <Col md="4" key={book.bookId} className="mb-3">
            <Card border="dark">
              {book.image && <Card.Img src={book.image} alt={`Cover for ${book.title}`} top />}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className="small">Authors: {book.authors?.join(', ') || 'Unknown'}</p>
                <Card.Text>{book.description}</Card.Text>
                <Button
                  className="btn-block btn-danger"
                  onClick={() => handleDeleteBook(book.bookId)}
                >
                  Delete this Book
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SavedBooks;
