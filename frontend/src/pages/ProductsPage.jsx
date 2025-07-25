import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import ProductFormModal from '../components/ProductFormModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';

const PageContainer = styled.div`
  padding: 30px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PageHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-size: 1.8rem;
`;

const AddButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  &:hover { background-color: var(--primary-hover); }
`;

const TableContainer = styled.div`
  background-color: var(--bg-surface);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const TableWrapper = styled.div`
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 15px 20px;
  background-color: var(--bg-main);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  vertical-align: middle;
`;

const Tr = styled.tr`
  &:last-child {
    ${Td} {
      border-bottom: none;
    }
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  margin-right: 15px;
  &:hover { color: ${props => props.$danger ? 'var(--red-color)' : 'var(--primary-color)'}; }
`;

const ProductImage = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 8px;
    object-fit: cover;
`;

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await getProducts();
            setProducts(res.data);
        } catch (error) {
            toast.error("Gagal memuat produk.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (productData) => {
        const promise = editingProduct
            ? updateProduct(editingProduct.id, productData)
            : createProduct(productData);

        toast.promise(promise, {
            pending: 'Menyimpan produk...',
            success: 'Produk berhasil disimpan!',
            error: 'Gagal menyimpan produk.'
        });

        try {
            await promise;
            fetchProducts();
        } catch(err) {
            console.error(err);
        } finally {
            handleCloseModal();
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            const promise = deleteProduct(id);
            toast.promise(promise, {
                pending: 'Menghapus produk...',
                success: 'Produk berhasil dihapus!',
                error: 'Gagal menghapus produk.'
            });
            await promise;
            fetchProducts();
        }
    };

    return (
        <PageContainer>
            <PageHeader>
                <Title>Manajemen Produk</Title>
                <AddButton onClick={() => handleOpenModal()}>
                    <FiPlus /> Tambah Produk
                </AddButton>
            </PageHeader>
            <TableContainer>
                <TableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Gambar</Th>
                                <Th>Nama Produk</Th>
                                <Th>Harga</Th>
                                <Th>Stok</Th>
                                <Th>Aksi</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <Tr key={index}>
                                        {[...Array(5)].map((_, i) => <Td key={i}><Skeleton /></Td>)}
                                    </Tr>
                                ))
                            ) : (
                                products.map(product => (
                                    <Tr key={product.id}>
                                        <Td><ProductImage src={product.image_url || `https://placehold.co/100/EAEBF0/1D2129?text=${product.name.charAt(0)}`} /></Td>
                                        <Td>{product.name}</Td>
                                        <Td>Rp {new Intl.NumberFormat('id-ID').format(product.price)}</Td>
                                        <Td>{product.stock}</Td>
                                        <Td>
                                            <ActionButton onClick={() => handleOpenModal(product)}><FiEdit size={18} /></ActionButton>
                                            <ActionButton $danger onClick={() => handleDeleteProduct(product.id)}><FiTrash2 size={18} /></ActionButton>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>
            </TableContainer>
            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveProduct}
                product={editingProduct}
            />
        </PageContainer>
    );
}

export default ProductsPage;