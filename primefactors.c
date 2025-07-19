#include <stdio.h>
#include <stdlib.h>

long long *get_prime_factors(long long num);
long long get_one_factor(long long num);

int main(int argc, char *argv[])
{
    if (argc == 1)
    {
        printf("Usage: primefactors num\n");
        return 1;
    }

    long long num = atoll(argv[1]);
    printf("Extracting prime factors of %lld...\n", num);

    long long *factors = get_prime_factors(num);
    if (factors == NULL)
    {
        printf("Out of memory!\n");
        return 2;
    }
    long long x;
    int pos = 0;
    while (1)
    {
        x = *(factors + pos);
        if (x == 0)
        {
            free(factors);
            printf("\n");
            return 0;
        }
        printf("%lld ", x);
        pos++;
    }
}

long long *get_prime_factors(long long num)
{
    long long factor;
    long long *old_result = NULL;
    long long *result;
    int factor_count = 0;
    int size = sizeof(long long);

    while (1)
    {
        factor = get_one_factor(num);
        /* Get some space for the new factor, plus all the old ones,
        plus 0 which we need to mark the end of the factor list.
        It must not overlap with any previous space we got. */
        do
        {
            result = malloc(size * (factor_count + 2));
        }
        while (result <= old_result + factor_count + 1);
        if (result == NULL)
        {
            return NULL;
        }

        // Copy previous factors into new location
        for (int i = 0; i < factor_count; i++)
        {
            *(result + i) = *(old_result + i);
        }

        // Record new factor
        *(result + factor_count) = factor;
        // Stick in 0 as a placeholder
        *(result + factor_count + 1) = 0;
        if (factor == num)
        {
            return result;
        }

        // Decrement the number
        num = (long long) num / factor;

        free(old_result);
        old_result = result;
        factor_count++;
    }
}

long long get_one_factor(long long num)
{
    for (long long y = 2; y < num; y ++)
    {
        if (num % y == 0)
        {
            return y;
        }
    }
    return num;
}
