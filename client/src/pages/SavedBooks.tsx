import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col, Spinner } from 'react-bootstrap';

import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
  // Fetch user data including saved books
  const { loading, data, refetch } = useQuery(GET_ME); // Refetch after mutation to update the UI
  const [removeBook] = useMutation(REMOVE_BOOK);

  // Extract saved books from query data
  const savedBooks = data?.me?.savedBooks || [];

  // Handle book removal
  const handleDeleteBook = async (bookId: string) => {
    try {
      // Call mutation to remove book from server
      await removeBook({
        variables: { bookId },
      });

      // Refetch data to update the UI with the latest saved books
      refetch();
    } catch (err) {
      console.error('Error removing book:', err);
    }
  };

  // Display loading state while fetching data
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center pt-5">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading...</span>
      </div>
    );
  }

  return (
    <Container>
      <h2 className="pt-5">
        {savedBooks.length
          ? `You have ${savedBooks.length} saved books:`
          : 'You have no saved books!'}
      </h2>
      <Row>
        {/* Map over savedBooks array to render each book */}
        {savedBooks.map((book: any) => (
          <Col md="4" key={book.bookId}>
            <Card border="dark" className="mb-4">
              {book.image && (
                <Card.Img
                  src={book.image}
                  alt={`The cover for ${book.title}`}
                  variant="top"
                />
              )}
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className="small">Authors: {book.authors.join(', ')}</p>
                <Card.Text>{book.description}</Card.Text>
                <div className="d-grid gap-2">
                  <Button
                    as="a"
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                  >
                    View on Google Books
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Remove this Book
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SavedBooks;