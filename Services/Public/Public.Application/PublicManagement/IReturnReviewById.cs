﻿using Public.Contracts;
using Public.Domain;

namespace Public.Application.PublicManagement;

public interface IReturnReviewById
{
    public Task<ReviewDetails?> Handle(int review_id);
    public Task<bool> HandleView(int review_id);
}